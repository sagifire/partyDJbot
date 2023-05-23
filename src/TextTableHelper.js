

class TextTableHelper
{
    constructor(config) {
        this.config = config;
        this.columnsInfo = [];
        this.columnIndex = 0;
        this.rowIndex = 0;
        this.data = [];
    }

    push(item)
    {
        if (this.data.length <= this.rowIndex) {
            this.data[this.rowIndex] = [];
        }

        item = "" + item;
        item = item.trim();

        this.data[this.rowIndex][this.columnIndex] = item;

        this.keepColumnMaxSize(this.columnIndex, item.length);

        this.columnIndex++;

        if (this.columnIndex >= this.config.columns.length) {
            this.columnIndex = 0;
            this.rowIndex++;
        }
    }

    pushRow(row)
    {
        if (this.data.length <= this.rowIndex) {
            this.data[this.rowIndex] = [];
        }

        if (row && row.constructor === Object) {
            row = row.values();
        }

        for (let index = 0; index < this.config.columns.length; index++) {
            if ('undefined' !== typeof(row[index])) {
                let item = row[index];
                item = "" + item;
                item = item.trim();
                this.data[this.rowIndex][index] = item;

                this.keepColumnMaxSize(index, item.length);
            }
        }

        this.rowIndex++;
    }

    keepColumnMaxSize(index, size)
    {
        if ('undefined' === typeof this.columnsInfo[index]) {
            this.columnsInfo[index] = 0;
        }

        if (this.columnsInfo[index] < size) {
            this.columnsInfo[index] = size;
        }
    }

    render()
    {
        let pageMode = ('undefined' !== typeof this.config.perPage && this.config.perPage > 0);

        let content = pageMode ? [] : '';

        for (let index = 0; index < this.data.length; index++) {
            let row = this.renderRow(index);

            if (pageMode) {
                let pageIndex = parseInt(index/this.config.perPage);
                if ('undefined' === typeof content[pageIndex]) {
                    content[pageIndex] = '';
                }
                content[pageIndex] += row + "\n";
            } else {
                content += row + "\n";
            }
        }

        if (pageMode && 'undefined' !== typeof (this.config.pageContainer)) {
            for (let index = 0; index < content.length; index++) {
                content[index] = this.config.pageContainer + content[index] + this.config.pageContainer;
            }
        }

        return content;
    }

    renderRow(index) {
        let rowString = '';

        for (let columnIndex = 0; columnIndex < this.config.columns.length; columnIndex++) {
            let item = ('undefined' === typeof this.data[index][columnIndex]) ? '' : this.data[index][columnIndex];

            let leftAlign = ('undefined' === typeof this.config.columns[columnIndex]['align'] || 'right' !== this.config.columns[columnIndex]['align']);

            let maxLength = ('undefined' === typeof this.columnsInfo[columnIndex]) ? 0 : this.columnsInfo[columnIndex];
            let alignSpacer = ' '.repeat(maxLength - item.length);

            if (leftAlign) {
                item = item + alignSpacer;
            } else {
                item = alignSpacer + item;
            }

            let marginLeft = 0;
            let marginRight = 0;

            if ('undefined' !== typeof this.config.columns[columnIndex]['margin']) {
                marginLeft = marginRight = this.config.columns[columnIndex]['margin'];
            }

            if ('undefined' !== typeof this.config.columns[columnIndex]['marginLeft']) {
                marginLeft = this.config.columns[columnIndex]['marginLeft'];
            }

            if ('undefined' !== typeof this.config.columns[columnIndex]['marginRight']) {
                marginRight = this.config.columns[columnIndex]['marginRight'];
            }

            rowString += (' '.repeat(marginLeft)) + item + (' '.repeat(marginRight));
        }

        return rowString;
    }
}

export default TextTableHelper;