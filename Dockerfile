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
    com.docker.desktop.extension.api.version=">= 0.2.0" \
    com.docker.desktop.extension.icon="healthchecks-ui.svg"
    # com.docker.extension.screenshots='[{"alt":"docker info", "url":"https://docker-extension-screenshots.s3.amazonaws.com/minimal-docker-cli/1-get-docker-info.png"}]' \
    # com.docker.extension.detailed-description="<h1>Description</h1><p>This is a sample extension that uses the <code>docker info</code> command to display the number of allocated CPUs and allocated memory by the Docker Desktop VM.</p>" \
    # com.docker.extension.publisher-url="https://www.docker.com" \
    # com.docker.extension.additional-urls='[{"title":"SDK Documentation","url":"https://docs.docker.com/desktop/extensions-sdk"}]' \
    # com.docker.extension.changelog="<ul><li>Added metadata to provide more information about the extension.</li></ul>"

COPY --from=client-builder /app/client/dist ui
COPY metadata.json .
COPY healthchecks-ui.svg .