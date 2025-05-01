# Use official Node.js runtime as base image
FROM node:22.13.1-alpine

WORKDIR /usr/src/app

RUN addgroup -S node && adduser -S node -G node || true

COPY package*.json ./

RUN npm install

COPY --chown=node:node . .

RUN mkdir -p uploads temp && chown -R node:node uploads temp

RUN mkdir -p src/swagger && chown -R node:node src/swagger

ENV NODE_ENV=production
ENV PORT=5000

USER node

EXPOSE 5000

CMD ["npm", "start"]