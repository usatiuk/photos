FROM node:14

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

RUN mkdir frontend
WORKDIR frontend
COPY ./frontend/package*.json ./
RUN npm ci --only=production
WORKDIR ../

COPY . .

WORKDIR frontend
RUN npm run build
WORKDIR ../

#ENV PORT=8080
ENV DATA_DIR=data

ENV TYPEORM_CONNECTION=mariadb
#ENV TYPEORM_HOST=localhost
#ENV TYPEORM_USERNAME=root
#ENV TYPEORM_PASSWORD=admin
#ENV TYPEORM_DATABASE=test
#ENV TYPEORM_PORT=3000
ENV TYPEORM_SYNCHRONIZE=false
ENV TYPEORM_LOGGING=false
ENV TYPEORM_ENTITIES=src/entity/**/*.ts
ENV TYPEORM_ENTITIES_DIR=src/entity
ENV TYPEORM_MIGRATIONS=src/migration/**/*.ts
ENV TYPEORM_MIGRATIONS_DIR=src/migration
ENV TYPEORM_SUBSCRIBERS=src/subscriber/**/*.ts
ENV TYPEORM_SUBSCRIBERS_DIR=src/subscriber
ENV TYPEORM_DRIVER_EXTRA='{"charset": "utf8mb4"}'
ENV NODE_ENV=production

#EXPOSE 8080

RUN ["chmod", "+x", "dockerentry.sh"]

CMD [ "./dockerentry.sh" ]
