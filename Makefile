ARCHIVE=clat.zip

.PHONY: all
all: clean archive

.PHONY: clean
clean:
	rm -f $(ARCHIVE)

.PHONY: archive
archive: $(ARCHIVE)

$(ARCHIVE):
	zip -r $(ARCHIVE) _locales icons *.js *.json LICENSE.md
