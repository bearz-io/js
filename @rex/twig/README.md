# @rex/twig

## Overview

The `@rex/twig` module provides rex tasks for interpolating
twig templates. 

The primary rex tasks `twigTask`

## Documentation

Documentation is available on [jsr.io/@rex/ssh-native/doc](https://jsr.io/@rex/ssh-native/doc)

Documentation about the rex cli is available [jsr.io/@rex/cli/doc](https://jsr.io/@rex/cli/doc)

## Basic Usage

```ts
import { task, fs } from "@rex/rexfile"
import { twigTask } from "@rex/twig"

// rex environment variables and secrets are made available 
// to the template as .env and .secrets properties to the template.

twigTask("traefik:conf", {
    // source template
    src: "./src/traefik/etc/traefik.yaml.twig",
    // destination file that uses interpolated environment variable
    dest: "./src/traefik/etc/${REX_CONTEXT}.traefik.yaml",
    // use values from the yaml file as data for the template.
    valueFiles: ["./etc/config.${REX_CONTEXT}.yaml"],
})

// rex task uptime
```


```yaml
# ./src/traefik/etc/traefik.yaml.twig
api:
  dashboard: {{ traefik.api.dashboard | default(true) }}

log:
  level: {{ traefik.log.level | default("DEBUG") }}
  filePath: {{ traefik.log.filePath | default("/var/log/traefik/traefik.log") }}

accessLog:
  filePath: {{ traefik.accessLog.filePath | default("/var/log/traefik/access.log") }}

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: 
  file:
    directory: "/etc/traefik/dynamic"
    watch: true

entryPoints:
  http:
    address: ":80"

  https:
    address: ":443"
{% for endpoint in traefik.endpoints %}
  {{ endpoint.name }}:
    address: ":{{ endpoint.public }}"
{% endfor %}
  


{% if traefik.acme.enabled %}
certificatesResolvers:
  le:
    acme:
      email: {{ env.ACME_EMAIL }}
      storage: acme.json
{% if traefik.acme.staging %}
      caServer: "https://acme-staging-v02.api.letsencrypt.org/directory"
{% endif %}
{% if traefik.acme.cloudflare %}
      dnsChallenge:
        provider: cloudflare
        delayBeforeCheck: 20
        resolvers:
          - "1.1.1.1:53"
          - "1.0.0.1:53"
{% endif %}
{% endif %}
```

```yaml
# ./etc/config.default.yaml
traefik:
  log:
    level: DEBUG

  api:
    dashboard: true

  endpoints:
    - name: mysql
      public: "3306"
      private: "3306"

  networks:
    frontend:
      suffix: .0.2

  acme:
    enabled: true
    email: "admin@rex"
    cloudflare: true
```



[MIT License](./LICENSE.md)