---
title: "Antenna Fundamentals"
pubDate: 2008-01-05T16:21:28Z
description: ''
tags: ["java","programming","compile"]
category: "development"
heroImage: ''
aliases: ["/wiki/ANT"]
---

Notizen zum Thema wie ANT files aufgebaut sind.

<!--more-->

## Aufbau von Ant-Files
Das Ant File heisst immer: `build.xml`

Hällt man sich daran braucht man kein AntFile anzugeben.

Tag | Beschreibung
---- | ----
project | Ant Files beginnen immer mit dem `<project>` Tag. Dieser geht über das ganze File und hat den Parameter default. Wird nichts anderes angegeben führt er das Target mit dem im default Parameter angegebenen Namen aus.
target | Der Target Tag ist im Projet enthalten. Er hat den Parameter name. Dieser Wert ist frei wählbar.
echo | Gibt die Message im Parameter message aus.

```xml
<project default="nina">
  <target name="franziska">
   <echo message="Hello Franziska"/>
  </target>
  <target name="nina">
   <echo message="Hallo Nina"/>
  </target>
</project>
```

## Abhängikeit
Ist ein Taget vom andern abhängig, so kann das in der Folgenden weise bekundet werden:
```xml
<target name="ich" depends="du,ihr">
```
Dann werden beim aufruf von "ich" immer erst "du" und "ihr" aufgerufen.

## Variabeln
Variabeln können mit dem Folgenden Befehl definiert werden:
```xml
<property name="location" location="/home/noah" />
```
Eingesetzt werden können die Variabeln mit:
```xml
${obj-dir}
```

## Java Compilieren
Zum übersetzen von java kann in einem `<target>` einfach der `<javac>` Tag verwendet werden. Wird der Parameter "srcdir" angegeben, so werden alle .java Files in diesem Verzeichnis übersetzt.
```xml
<javac srcdir="." />
```

## Jar File erstellen
Um ein Jar File zu erstellen kann innerhalb eines Targets der `<jar>` Tag verwendet werden. Ein jar kann sich selber natürlich nicht enthalten. Im Beispiel werden alle .class Files in allen Unterordnern von basedir zum jar hallo.jar hinzugefügt.
Welches die Mainclass ist kann nicht direkt angegeben werden.
```xml
<jar destfile="hello.jar" basedir="." includes="**/*.class" />
```

## Ausführen von Java Code
```xml
<java classname="hello" classpath="hello.jar" fork="true" />
```
Damit wird ein neuer Prozess erstellt der die Klasse "hello" aus im Jar hello.jar ausführt.

## Erstellen von Ordnern
```xml
<mkdir dir="/home/noah/myproject" />
```

## Löschen von Ordnern und Dateien
```xml
<delete dir="/home/noah/myproject" />
<delete file="/tmp/huj" />
<delete>
<fileset dir="/home/noah/myproject" includes="**/*.class" />
</delete>
```

## JUnit Tests
Unitests können auch ausgeführt werden. Oft gibt es Probleme weil junit.jar nicht im Class-Path ist.
```xml
<junit>
  <test name="ExampleTest" />
</junit>
```

## Classpath definieren
Direkt im `<project>` Tag:
```xml
  <path id="classpath.base">
  </path>
  <path id="classpath.test">
    <pathelement location="/usr/lib/java/junit.jar" />
    <pathelement location="." />
    <path refid="classpath.base" />
  </path>
```

Später kann mit
```xml
<classpath refid="classpath.test" />
```
darauf zugegriffen werden. Z.B. innerhalbe eines JUnit-Tags.