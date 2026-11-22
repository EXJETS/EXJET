FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn
COPY . .
ENV EXJET_DB=/data/exjet.db EXJET_UPLOADS=/data/uploads EXJET_SALE_PHOTOS=/data/sale_photos EXJET_DEMO=0 EXJET_HTTPS=1 EXJET_PROXY=1 PORT=8000
VOLUME /data
CMD sh -c "python init_db.py catalog.sqlite && gunicorn -w 1 --threads 8 -b 0.0.0.0:$PORT app:app"
