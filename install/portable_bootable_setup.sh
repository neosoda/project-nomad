#!/usr/bin/env bash
set -Eeuo pipefail

# Prepare a Debian host for Project N.O.M.A.D. portable/bootable usage.
# - Makes data partition persistent at /mnt/nomad_data (configurable)
# - Moves project persistent paths to DATA partition using symlinks
# - Optionally enables overlayroot for immutable root filesystem

SCRIPT_NAME="$(basename "$0")"
DATA_MOUNT="/mnt/nomad_data"
DATA_DEVICE=""
ENABLE_OVERLAYROOT="false"
ASSUME_YES="false"

log() { printf '[INFO] %s\n' "$*"; }
warn() { printf '[WARN] %s\n' "$*"; }
err() { printf '[ERROR] %s\n' "$*" >&2; }

usage() {
  cat <<USAGE
Usage: sudo $SCRIPT_NAME [options]

Options:
  --data-device <device|UUID|LABEL=...>  Device for data partition (required if LABEL=NOMAD_DATA is absent)
  --data-mount <path>                    Data mount point (default: /mnt/nomad_data)
  --enable-overlayroot                   Enable immutable root via /etc/overlayroot.conf
  --assume-yes                           Non-interactive mode
  -h, --help                             Show this help

Example:
  sudo $SCRIPT_NAME --data-device LABEL=NOMAD_DATA --enable-overlayroot
USAGE
}

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    err "This script must run as root."
    exit 1
  fi
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --data-device)
        [[ $# -ge 2 ]] || { err "Missing value for --data-device"; exit 1; }
        DATA_DEVICE="$2"
        shift 2
        ;;
      --data-mount)
        [[ $# -ge 2 ]] || { err "Missing value for --data-mount"; exit 1; }
        DATA_MOUNT="$2"
        shift 2
        ;;
      --enable-overlayroot)
        ENABLE_OVERLAYROOT="true"
        shift
        ;;
      --assume-yes)
        ASSUME_YES="true"
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        err "Unknown option: $1"
        usage
        exit 1
        ;;
    esac
  done
}

confirm_or_exit() {
  local prompt="$1"
  if [[ "$ASSUME_YES" == "true" ]]; then
    return 0
  fi
  read -r -p "$prompt [y/N]: " answer
  if [[ ! "$answer" =~ ^[Yy]$ ]]; then
    log "Cancelled by user."
    exit 0
  fi
}

ensure_packages() {
  local packages=(btrfs-progs rsync)
  if [[ "$ENABLE_OVERLAYROOT" == "true" ]]; then
    packages+=(overlayroot)
  fi

  log "Installing required packages: ${packages[*]}"
  apt-get update -y
  DEBIAN_FRONTEND=noninteractive apt-get install -y "${packages[@]}"
}

resolve_data_device() {
  if [[ -z "$DATA_DEVICE" ]]; then
    if blkid -t LABEL=NOMAD_DATA -o device >/dev/null 2>&1; then
      DATA_DEVICE="LABEL=NOMAD_DATA"
      log "Detected data partition by label: NOMAD_DATA"
    else
      err "Data partition not provided and LABEL=NOMAD_DATA not found."
      err "Pass --data-device <device|UUID|LABEL=...>."
      exit 1
    fi
  fi
}

get_uuid() {
  local resolved
  resolved="$(blkid -o device "$DATA_DEVICE" 2>/dev/null || true)"
  if [[ -z "$resolved" || ! -b "$resolved" ]]; then
    resolved="$DATA_DEVICE"
  fi

  if [[ -b "$resolved" ]]; then
    blkid -s UUID -o value "$resolved"
    return
  fi

  # Accept UUID=... or LABEL=... format as fstab spec directly
  if [[ "$DATA_DEVICE" =~ ^UUID= ]]; then
    echo "${DATA_DEVICE#UUID=}"
    return
  fi

  if [[ "$DATA_DEVICE" =~ ^LABEL= ]]; then
    local label="${DATA_DEVICE#LABEL=}"
    blkid -t "LABEL=$label" -o value -s UUID
    return
  fi

  err "Unable to resolve UUID for data device: $DATA_DEVICE"
  exit 1
}

upsert_fstab() {
  local data_uuid="$1"
  local fstab_line="UUID=${data_uuid} ${DATA_MOUNT} btrfs defaults,noatime,compress=zstd:3,commit=120,space_cache=v2,autodefrag,nofail 0 2"

  mkdir -p "$DATA_MOUNT"
  cp /etc/fstab "/etc/fstab.backup.$(date +%Y%m%d%H%M%S)"

  if grep -Eq "^[^#].*[[:space:]]${DATA_MOUNT//\//\\/}[[:space:]]" /etc/fstab; then
    log "Updating existing fstab entry for ${DATA_MOUNT}"
    awk -v mountpoint="$DATA_MOUNT" -v replacement="$fstab_line" '
      BEGIN { done=0 }
      $0 ~ "^[^#]" && $2 == mountpoint { print replacement; done=1; next }
      { print }
      END { if (!done) print replacement }
    ' /etc/fstab > /etc/fstab.new
    mv /etc/fstab.new /etc/fstab
  else
    log "Adding fstab entry for ${DATA_MOUNT}"
    printf '%s\n' "$fstab_line" >> /etc/fstab
  fi

  mount "$DATA_MOUNT" || mount -a

  if ! mountpoint -q "$DATA_MOUNT"; then
    err "Failed to mount ${DATA_MOUNT}"
    exit 1
  fi
}

migrate_dir_to_data() {
  local source_dir="$1"
  local target_dir="$2"

  mkdir -p "$target_dir"

  if [[ -L "$source_dir" ]]; then
    log "Symlink already exists: $source_dir"
    return 0
  fi

  if [[ -d "$source_dir" ]]; then
    if [[ -n "$(find "$source_dir" -mindepth 1 -maxdepth 1 2>/dev/null)" ]]; then
      log "Migrating data: $source_dir -> $target_dir"
      rsync -aHAX --delete "$source_dir/" "$target_dir/"
    fi
    rm -rf "$source_dir"
  fi

  ln -s "$target_dir" "$source_dir"
}

enable_overlayroot() {
  local conf_file="/etc/overlayroot.conf"

  if [[ ! -f "$conf_file" ]]; then
    echo 'overlayroot="tmpfs:recurse=0"' > "$conf_file"
    return
  fi

  if grep -Eq '^overlayroot=' "$conf_file"; then
    sed -i 's#^overlayroot=.*#overlayroot="tmpfs:recurse=0"#' "$conf_file"
  else
    printf '\noverlayroot="tmpfs:recurse=0"\n' >> "$conf_file"
  fi
}

main() {
  parse_args "$@"
  require_root

  resolve_data_device

  log "Planned configuration:"
  log "- DATA_DEVICE: ${DATA_DEVICE}"
  log "- DATA_MOUNT: ${DATA_MOUNT}"
  log "- ENABLE_OVERLAYROOT: ${ENABLE_OVERLAYROOT}"

  confirm_or_exit "Apply these changes to this host?"

  ensure_packages

  local data_uuid
  data_uuid="$(get_uuid)"
  upsert_fstab "$data_uuid"

  # Keep Project N.O.M.A.D persistent paths on DATA partition
  mkdir -p "${DATA_MOUNT}/nomad_persist"
  migrate_dir_to_data "/opt/project-nomad" "${DATA_MOUNT}/nomad_persist/project-nomad"
  migrate_dir_to_data "/var/lib/docker" "${DATA_MOUNT}/nomad_persist/docker"

  if [[ "$ENABLE_OVERLAYROOT" == "true" ]]; then
    enable_overlayroot
    log "overlayroot configured. Reboot required to activate immutable root."
  fi

  log "Portable/bootable host setup complete."
  log "Next step: run your NOMAD install/update from /opt/project-nomad (now on DATA partition)."
}

main "$@"
