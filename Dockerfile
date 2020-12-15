# this file gets published to github which triggers a webhook to build a new container image on docker hub
#
# Pull base image Long Term Support node image is used.
FROM node:lts

# Install updates and wget.
RUN \
  apt-get update && \
  apt-get -y upgrade && \
  apt-get install -y wget git

# Set environment variables.
ENV HOME /root/Mars

# Define working directory.
WORKDIR /root/Mars

# Add files.
COPY . /root/Mars/

# remove file which are not needed in the container
RUN rm -rf *local* *.yml *.md

# install dependencies and run package.json
RUN npm i

# Define default command.
CMD tail -f /dev/null

# ENTRYPOINT [ "node main.js -c ./config/config.local.json" ]