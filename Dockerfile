# build stage
FROM node:20.5-slim as build-stage
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Expose the port 80
EXPOSE 80
# Start Nginx to serve the application
CMD ["nginx", "-g", "daemon off;"]