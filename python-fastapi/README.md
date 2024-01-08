python-fastapi
=====

```shell
# データを消して再起動
docker compose down -v
docker compose up --build -d

# python だけを再起動
docker compose down app
docker compose up --build app -d

# おかしなログが出ていないか確認
docker compose logs -f

# 停止
docker compose down -v
```

Taskを作成するリクエスト

```sh
# request
curl -X 'POST' \
  'http://localhost:8000/tasks/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "title hoge",
  "description": "description hoge",
  "status": "ready",
  "assignee": "my name"
}'

# response
{"title":"title hoge","description":"description hoge","status":"ready","assignee":"my name","id":1}
```

psql コマンドを使用して tasks テーブルをクエリします

```sh
$ PGPASSWORD=sandbox_user psql -h0.0.0.0 -p 5432 -U sandbox_user sandbox

sandbox=# select * from tasks;
 id |   title    |   description    | status | assignee
----+------------+------------------+--------+----------
  1 | title hoge | description hoge | READY  | my name
(1 row)
```

docker の psql client を使用する場合

```sh
$ docker run --rm --name psql-client -e PGPASSWORD=sandbox_user -it postgres:14.2 psql -h host.docker.internal -U sandbox_user -p 5432 sandbox

sandbox=# select * from tasks;
 id |   title    |   description    | status | assignee
----+------------+------------------+--------+----------
  1 | title hoge | description hoge | READY  | my name
(1 row)
```

### API Document を確認する

FastAPI では下記が自動生成されます

- [redoc](http://localhost:8000/redoc)
- [openapi](http://localhost:8000/docs)

OpenAPIを通してAPIにリクエストを送ることが可能です。

### POST /tasks

```sh
curl -X 'POST' \
  'http://localhost:8000/tasks/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "title hoge",
  "description": "description hoge",
  "status": "ready",
  "assignee": "ohshiro"
}'
```

### GET /tasks

```sh
curl -X 'GET' \
  'http://localhost:8000/tasks/?skip=0&limit=100' \
  -H 'accept: application/json'
```

### Fix code format and lint

flake8, black, isort を使用して code format の auto-fix と lint を行います。

```
docker compose exec app make format-fix lint
```

### psql の操作

```shell
$ PGPASSWORD=sandbox_user psql -h0.0.0.0 -p 5432 -U sandbox_user sandbox
psql (14.9 (Homebrew), server 14.2 (Debian 14.2-1.pgdg110+1))
Type "help" for help.

sandbox=# \d
              List of relations
 Schema |     Name     |   Type   |   Owner   
--------+--------------+----------+-----------
 public | tasks        | table    | sandbox_user
 public | tasks_id_seq | sequence | sandbox_user
(2 rows)

sandbox=# select * from tasks;
 id |   title    |   description    | status | assignee 
----+------------+------------------+--------+----------
  1 | string     | string           | READY  | string
  2 |            | string           | READY  | string
  3 | title hoge | description hoge | READY  | ohshiro
  4 | title hoge | description hoge | READY  | ohshiro
(4 rows)

sandbox=# \d tasks;
                                    Table "public.tasks"
   Column    |       Type        | Collation | Nullable |              Default              
-------------+-------------------+-----------+----------+-----------------------------------
 id          | integer           |           | not null | nextval('tasks_id_seq'::regclass)
 title       | character varying |           |          | 
 description | character varying |           |          | 
 status      | taskstatus        |           |          | 
 assignee    | character varying |           |          | 
Indexes:
    "tasks_pkey" PRIMARY KEY, btree (id)
    "ix_tasks_assignee" btree (assignee)
    "ix_tasks_description" btree (description)
    "ix_tasks_id" btree (id)
    "ix_tasks_title" btree (title)


sandbox=# truncate tasks;
TRUNCATE TABLE
sandbox=# select * from tasks;
 id | title | description | status | assignee 
----+-------+-------------+--------+----------
(0 rows)

sandbox=# 
```
