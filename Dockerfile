FROM node:alpine
LABEL maintainer="bitofant"

ARG HTTP_PORT=8080

EXPOSE ${HTTP_PORT}
ENV HTTP_PORT=${HTTP_PORT}
ENV NODE_ENV=production

ENV HOME /var/app
RUN mkdir ${HOME}

WORKDIR $HOME
COPY package.json $HOME
RUN cd $HOME && \
    npm i
COPY . $HOME
RUN npm run build
CMD ["npm","start"]
