FROM php:8.4-apache

# Cài đặt các thư viện hệ thống cần thiết và các extensions PHP
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd bcmath zip pdo_mysql opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Cấu hình Apache: Bật mod_rewrite cho Laravel routing
RUN a2enmod rewrite

# Cập nhật DocumentRoot của Apache trỏ vào thư mục public của Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Cài đặt Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Thiết lập thư mục làm việc
WORKDIR /var/www/html

# Copy source code của backend vào container
COPY . .

# Cấp quyền ghi cho các thư mục cache/logs của Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Cài đặt các thư viện PHP
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts --ignore-platform-reqs

# Cấu hình cổng chạy mặc định theo biến PORT của Render
RUN sed -i 's/Listen 80/Listen ${PORT}/g' /etc/apache2/ports.conf
RUN sed -i 's/<VirtualHost \*:80>/<VirtualHost \*:${PORT}>/g' /etc/apache2/sites-available/*.conf

# Chạy Laravel Optimization và Apache server khi container start
CMD php artisan config:cache && php artisan route:cache && apache2-foreground
