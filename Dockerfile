FROM ruby:3.3-alpine

WORKDIR /app

RUN apk add --no-cache build-base sqlite-dev tzdata

COPY Gemfile ./
RUN bundle install

COPY . .

ENV PORT=10000
ENV BIND_ADDRESS=0.0.0.0
ENV DB_PATH=/data/app.db
ENV UPLOAD_DIR=/data/uploads

VOLUME ["/data"]

EXPOSE 10000

CMD ["bundle", "exec", "ruby", "server.rb"]
