#!/bin/bash
# -----------------------------------------------
# PERINTAH UNTUK DEPLOY KE GITHUB
# Anda bisa salin dan tempel baris di bawah ini
# atau jalankan skrip ini dengan: ./deploy.sh "Pesan Anda"
# -----------------------------------------------

# Pesan komit dari argumen pertama, atau gunakan pesan default
COMMIT_MESSAGE="${1:-Update}"

# 1. Tambahkan semua perubahan
git add .
echo "✅ Perubahan ditambahkan (git add .)"

# 2. Lakukan komit pada perubahan
git commit -m "$COMMIT_MESSAGE"
echo "✅ Perubahan di-commit (git commit)"

# 3. Kirim ke GitHub
git push
echo "🎉 Berhasil dikirim ke GitHub (git push)"
