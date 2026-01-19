FROM python:3.13.5-slim

WORKDIR /app/backend
ENV PYTHONPATH=/app/backend

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

CMD ["sh", "-c", "if [ \"$PROD\" = \"true\" ]; then \
    gunicorn main:app -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 -w 4 --log-level info --access-logfile - --error-logfile -; \
    else \
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload; \
    fi"]