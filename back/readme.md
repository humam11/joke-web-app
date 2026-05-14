# Инструкция по разворачиванию


### 1. Создание виртуальной среды и установка зависимостей

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

```

### 2. Подготовка и запуск

```bash
python manage.py migrate
python manage.py runserver
```

### 3. Создание администратора

```bash
python manage.py createsuperuser
```
