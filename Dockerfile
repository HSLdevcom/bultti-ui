FROM node:12

ENV WORK /opt/bultti-ui

RUN mkdir -p ${WORK}
WORKDIR ${WORK}

# Install app dependencies
COPY yarn.lock ${WORK}
COPY package.json ${WORK}
RUN yarn

COPY . ${WORK}

ARG BUILD_ENV=production
COPY .env.${BUILD_ENV} ${WORK}/.env.production

# RUN yarn run test:ci
RUN yarn run build

CMD yarn run production
