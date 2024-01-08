.PHONY: lint
lint:
	poetry run flake8 .

.PHONY: format-check
format-check:
	poetry run black --check .
	poetry run isort . --check-only

.PHONY: format-fix
format-fix:
	poetry run black .
	poetry run isort .

.PHONY: test
test:
	echo TODO
