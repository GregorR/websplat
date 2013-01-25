TSC=tsc
TSC_FLAGS=-c

TS_FILES=\
    websplat.ts \
    websplat-pony.ts \
    websplat-goody.ts \
    websplat-bazooka.ts

JS_FILES=$(TS_FILES:.ts=.js)

all: $(JS_FILES)

%.js: %.ts jquery.d.ts
	$(TSC) $(TSC_FLAGS) $< || ( rm -f $@ ; false )

jquery.d.ts:
	cp "`which $(TSC) | xargs dirname`"/jquery.d.ts .

cont:
	@while true; do \
	    inotifywait -e close_write $(TS_FILES) > /dev/null 2> /dev/null; \
	    $(MAKE) all; \
	done

clean:
	rm -f $(JS_FILES) jquery.d.ts
