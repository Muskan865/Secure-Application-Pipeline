FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser
EXPOSE 4000
CMD ["npm", "start"]