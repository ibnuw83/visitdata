#!/bin/bash

# Keluar segera jika ada perintah yang gagal
set -e

# Periksa apakah pesan komit telah diberikan
if [ -z "$1" ]; then
  echo "Error: Tidak ada pesan komit yang diberikan."
  echo "Penggunaan: ./deploy.sh \"Pesan komit Anda\""
  exit 1
fi

COMMIT_MESSAGE="$1"

# Langkah 1: Tambahkan semua perubahan ke staging
echo "🚀 Menambahkan semua perubahan ke staging..."
git add .
echo "✅ Perubahan ditambahkan."

# Langkah 2: Lakukan komit pada perubahan
echo "📝 Melakukan komit dengan pesan: \"$COMMIT_MESSAGE\""
git commit -m "$COMMIT_MESSAGE"
echo "✅ Perubahan telah di-commit."

# Langkah 3: Kirim ke GitHub
echo "📤 Mengirim perubahan ke GitHub..."
git push
echo "🎉 Berhasil dikirim! Deployment Anda ke GitHub sedang diproses."
