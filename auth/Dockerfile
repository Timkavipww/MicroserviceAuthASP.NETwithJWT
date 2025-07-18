FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ./auth.csproj .
RUN dotnet restore

COPY . .

RUN dotnet publish -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app
COPY --from=build /app .

EXPOSE 8001
ENV ASPNETCORE_URLS=http://0.0.0.0:8001

ENTRYPOINT ["dotnet", "auth.dll"]