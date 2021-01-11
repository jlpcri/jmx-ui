FROM openjdk:8-jre-alpine
WORKDIR /
ADD ./build/libs/jmx-ui.jar jmx-ui.jar
EXPOSE 8686
CMD java -Xms1536m -Xmx1536m -XX:NewRatio=2 -Dserver.port=8686 -jar jmx-ui.jar
