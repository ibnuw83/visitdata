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
echo "🚀 Langkah 1: Menambahkan semua perubahan..."
git add .
echo "✅ Perubahan ditambahkan."

# Langkah 2: Lakukan komit pada perubahan
echo "📝 Langkah 2: Melakukan komit dengan pesan: \"$COMMIT_MESSAGE\""
git commit -m "$COMMIT_MESSAGE"
echo "✅ Perubahan telah di-commit."

# Langkah 3: Kirim ke remote repository
echo "📤 Langkah 3: Mengirim ke remote repository..."
git push
echo "🎉 Berhasil dikirim ke remote! Deployment Anda sedang diproses."
