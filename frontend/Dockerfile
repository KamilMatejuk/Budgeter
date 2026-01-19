FROM node:22-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install -g npm@11.7.0
RUN npm install

CMD ["sh", "-c", "if [ \"$PROD\" = \"true\" ]; then \
    npm run build && npm run start; \
    else \
    npm run dev; \
    fi"]
