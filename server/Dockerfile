FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npx prisma generate

ENV NODE_ENV=production
ENV PORT=3636

EXPOSE 3636

CMD ["node", "src/index.js"]
