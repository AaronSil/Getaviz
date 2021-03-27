FROM getaviz/evaluationserver-base:1.3.2
WORKDIR /usr/src/app/
COPY Gemfile .
COPY Gemfile.lock .
COPY wait-for-it.sh ./wait-for-it.sh
RUN bundle install --jobs 20 --retry 5 && gem install bundler
COPY . .
LABEL maintainer="david.baum@uni-leipzig.de" \
      version="1.0"
EXPOSE 8081
