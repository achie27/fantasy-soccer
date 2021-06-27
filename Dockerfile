FROM node:16
WORKDIR /fantasy-soccer

COPY . .
RUN npm run build

EXPOSE 3000
CMD [ "npm", "start" ]