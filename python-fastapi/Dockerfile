FROM python:3.12.0
ENV PYTHONUNBUFFERED 1

ENV POETRY_HOME /etc/poetry
ENV POETRY_VERSION 1.3.2
ENV PATH $POETRY_HOME/bin:$PATH
RUN pip install --upgrade pip && \
    curl -sSL https://install.python-poetry.org | python3 - --version $POETRY_VERSION && \
    poetry config virtualenvs.create false

WORKDIR /app
COPY pyproject.toml poetry.lock /app/
RUN poetry install

COPY . /app/
