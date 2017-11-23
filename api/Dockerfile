FROM node:alpine
MAINTAINER joeran.tesse@iteratec.de

ENV HOME /root

EXPOSE ${HTTP_PORT}

WORKDIR $HOME
COPY . $HOME
RUN cd $HOME && npm install
CMD ["npm","start"]
