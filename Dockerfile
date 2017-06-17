FROM node:8

RUN mkdir -p /root/relay/
WORKDIR /root/relay/

# Install dependencies
# Do this first to use caching
COPY package.json .
COPY yarn.lock .
RUN yarn

# Now copy the other source files
COPY . .

CMD ["yarn", "start-dev"]
