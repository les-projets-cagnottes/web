# Les Projets Cagnottes - web

[![Release](https://github.com/les-projets-cagnottes/web/workflows/Release/badge.svg)](https://github.com/les-projets-cagnottes/web/actions?query=workflow%3ARelease)
[![Integration](https://github.com/les-projets-cagnottes/web/workflows/Integration/badge.svg)](https://github.com/les-projets-cagnottes/web/actions?query=workflow%3AIntegration) 

## Prerequisites

- Les Projets Cagnottes - core - [Install Guide here](https://github.com/les-projets-cagnottes/core#getting-started)
- NodeJS 12 - [Download here](https://nodejs.org)
- Angular CLI 10+ - [Download here](https://cli.angular.io)

## Build

### Build with Angular CLI

With [Angular CLI](https://github.com/angular/angular-cli), you can build the app only :

```bash
npm install
ng build
```

### Build the Docker image

With Docker, you can build the image :

```bash
docker build . --build-arg configuration=production
```

## Run

### Run locally in development

With [Angular CLI](https://github.com/angular/angular-cli), you can run a dev server :

```bash
npm install
ng serve
```

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Run with Docker

On your host, create a `config.json` file with the following content :

```json
{
    "webUrl": "http://localhost:4200",
    "apiUrl": "http://localhost:8080/api",
    "slackClientId": "1267900044419.1280463132273",
    "version": "head",
    "versionUrl": "head"
}
```

Then, run the command :

```bash
docker run -d --name web \
  -p 80:80 \
  -e PORT="80" \
  -v <YOUR_HOST_DIRECTORY>/config.json:/usr/share/nginx/html/assets/config.json \
  lesprojetscagnottes/web:<tag>
```