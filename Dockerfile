FROM node:12.8.1-stretch as builder

COPY package.json package-lock.json ./
RUN npm ci && mkdir /ng-app && mv ./node_modules ./ng-app
WORKDIR /ng-app
COPY . .
RUN npm run ng build -- --prod --output-path=dist

FROM nginx:1.17.3

COPY nginx/default.conf /etc/nginx/conf.d/
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /ng-app/dist /usr/share/nginx/html
CMD ["/bin/bash", "-c", "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf", "&&", "nginx", "-g", "daemon off;"]