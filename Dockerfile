
# Pull base image.
FROM node:lts

# Install.
RUN \
  apt-get update && \
  apt-get -y upgrade && \
  apt-get install -y wget

# Set environment variables.
ENV HOME /root/Mars

# Define working directory.
WORKDIR /root/Mars

# Add files.
COPY . /root/Mars/

RUN rm -rf *local* *.yml *.md


RUN npm i

# Define default command.
CMD tail -f /dev/null
# ENTRYPOINT [ "node main.js -c ./config/config.local.json" ]