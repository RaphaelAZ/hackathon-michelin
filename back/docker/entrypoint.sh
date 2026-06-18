#!/bin/sh
set -e

echo "Waiting for database..."
until pg_isready -h "${DB_HOST:-db}" -p "${DB_PORT:-5432}" -U "${DB_USERNAME}" 2>/dev/null; do
    sleep 1
done
echo "Database ready."

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Supprimer les caches bootstrap qui pourraient référencer des classes absentes du vendor
rm -f /var/www/html/bootstrap/cache/packages.php
rm -f /var/www/html/bootstrap/cache/services.php

if [ "${CONTAINER_ROLE:-app}" = "app" ]; then
    php artisan migrate --force
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

exec "$@"
