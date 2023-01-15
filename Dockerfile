# might fix this? https://github.com/parcel-bundler/parcel/issues/6735
FROM node:16-bullseye as frontbuild

WORKDIR /usr/src/app/frontend
COPY ./frontend/package*.json ./
RUN npm ci --only=production
COPY ./frontend .
COPY ./src/shared ../src/shared
RUN npm run build && bash -O extglob -c 'rm -rfv !("dist")'
WORKDIR ../
RUN bash -O extglob -c 'rm -rfv !("frontend")'

FROM node:16-alpine as backexceptwithoutfrontend

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY ./ ./
RUN rm -rfv frontend

FROM backexceptwithoutfrontend

COPY --from=frontbuild /usr/src/app/frontend .

#ENV PORT=8080
#ENV TYPEORM_HOST=localhost
#ENV TYPEORM_USERNAME=root
#ENV TYPEORM_PASSWORD=admin
#ENV TYPEORM_DATABASE=test
#ENV TYPEORM_PORT=3000

ENV DATA_DIR=data\
    TYPEORM_CONNECTION=mariadb\
    TYPEORM_SYNCHRONIZE=false\
    TYPEORM_LOGGING=false\
    TYPEORM_ENTITIES=src/entity/**/*.ts\
    TYPEORM_ENTITIES_DIR=src/entity\
    TYPEORM_MIGRATIONS=src/migration/**/*.ts\
    TYPEORM_MIGRATIONS_DIR=src/migration\
    TYPEORM_SUBSCRIBERS=src/subscriber/**/*.ts\
    TYPEORM_SUBSCRIBERS_DIR=src/subscriber\
    TYPEORM_DRIVER_EXTRA='{"charset": "utf8mb4"}'\
    NODE_ENV=production

#EXPOSE 8080

RUN ["chmod", "+x", "dockerentry.sh"]

CMD [ "./dockerentry.sh" ]
