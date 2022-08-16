FROM node:17.7-alpine3.14 AS client-builder
WORKDIR /app/client
# cache packages in layer
COPY client/package.json /app/client/package.json
COPY client/yarn.lock /app/client/yarn.lock
ARG TARGETARCH
RUN yarn config set cache-folder /usr/local/share/.cache/yarn-${TARGETARCH}
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn-${TARGETARCH} yarn
# install
COPY client /app/client
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn-${TARGETARCH} yarn build

FROM scratch

LABEL org.opencontainers.image.title="HealthChecks UI" \
    org.opencontainers.image.description="A Docker Desktop Extension to surface container Healthchecks" \
    org.opencontainers.image.vendor="Addison Waldow" \
    com.docker.desktop.extension.api.version=">= 0.2.3" \
    com.docker.desktop.extension.icon="healthchecks-ui.svg" \ 
    com.docker.extension.screenshots='[{"alt":"docker healthchecks ui main light", "url":"https://raw.githubusercontent.com/awaldow/docker-desktop-healthchecks-ui/main/docs/iamges/main-light.png"},{"alt":"docker healthchecks ui main dark", "url":"https://raw.githubusercontent.com/awaldow/docker-desktop-healthchecks-ui/main/docs/iamges/main-dark.png"}]' \
    com.docker.extension.detailed-description="Docker Extension for aggregating and viewing healthcheck status and results from local containers" \
    com.docker.extension.publisher-url="https://github.com/awaldow/docker-desktop-healthchecks-ui" \
    #com.docker.extension.additional-urls='[{"title":"SDK Documentation","url":"https://docs.docker.com/desktop/extensions-sdk"}]' \
    com.docker.extension.changelog="<ul><li>Initial offering.</li></ul>"

COPY --from=client-builder /app/client/dist ui
COPY metadata.json .
COPY healthchecks-ui.svg .