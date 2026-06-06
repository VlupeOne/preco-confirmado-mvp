@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements. See the NOTICE file
@REM distributed with this work for additional information.
@REM The ASF licenses this file to You under the Apache License, Version 2.0.
@REM ----------------------------------------------------------------------------
@IF "%__MVNW_CMD__%"=="" @SET __MVNW_CMD__=%~nx0
@SET MVNW_VERBOSE=
@SET MVNW_REPOURL=https://repo.maven.apache.org/maven2
@SET WRAPPER_VERSION=3.3.4
@SET MAVEN_VERSION=3.9.11
@SET WRAPPER_URL=%MVNW_REPOURL%/org/apache/maven/wrapper/maven-wrapper/%WRAPPER_VERSION%/maven-wrapper-%WRAPPER_VERSION%.jar
@SET WRAPPER_JAR=%~dp0.mvn\wrapper\maven-wrapper.jar
@SET MAVEN_PROJECT_DIR=%~dp0
@SET MAVEN_PROJECT_DIR=%MAVEN_PROJECT_DIR:~0,-1%
@IF EXIST "%WRAPPER_JAR%" GOTO mvnwRun
@IF NOT EXIST "%~dp0.mvn\wrapper" MKDIR "%~dp0.mvn\wrapper"
@powershell -NoProfile -ExecutionPolicy Bypass -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -UseBasicParsing -Uri '%WRAPPER_URL%' -OutFile '%WRAPPER_JAR%'}"
@IF ERRORLEVEL 1 EXIT /B 1
:mvnwRun
@IF NOT "%JAVA_HOME%"=="" GOTO javaHomeSet
@java.exe -classpath "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECT_DIR%" org.apache.maven.wrapper.MavenWrapperMain %*
@EXIT /B %ERRORLEVEL%
:javaHomeSet
@"%JAVA_HOME%\bin\java.exe" -classpath "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECT_DIR%" org.apache.maven.wrapper.MavenWrapperMain %*
@EXIT /B %ERRORLEVEL%
