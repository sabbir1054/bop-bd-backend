FROM node:20-alpine
WORKDIR /bopBdBackend
COPY . .
RUN yarn install
RUN yarn build
EXPOSE 5002
RUN ["chmod","+x","./entrypoint.sh"]
ENTRYPOINT ["sh","./entrypoint.sh"]