FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html
COPY dashboard.html /usr/share/nginx/html/dashboard.html
COPY transactions.html /usr/share/nginx/html/transactions.html
COPY notifications.html /usr/share/nginx/html/notifications.html
COPY services.html /usr/share/nginx/html/services.html
COPY about.html /usr/share/nginx/html/about.html
COPY style.css /usr/share/nginx/html/style.css
COPY app.js /usr/share/nginx/html/app.js

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
