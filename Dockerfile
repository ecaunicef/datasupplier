FROM node:16.3.0-alpine

RUN mkdir -p /usr/src/app
RUN mkdir -p /var/importLog
RUN mkdir -p /var/dashboardDownload
RUN mkdir -p /var/constantFile
RUN mkdir -p /var/primaryDataFolder

WORKDIR /usr/src/app

COPY . .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production

# Expose the listening port of your app
EXPOSE 8042

# Show current folder structure in logs
RUN ls -al -R

CMD ["npm", "start"]

