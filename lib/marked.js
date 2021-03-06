'use strict';

var marked = require('marked');
var stripIndent = require('strip-indent');
var util = require('hexo-util');

var highlight = util.highlight;
var stripHTML = util.stripHTML;
var MarkedRenderer = marked.Renderer;

function Renderer() {
    MarkedRenderer.apply(this);

    this._headingId = {};
}

require('util').inherits(Renderer, MarkedRenderer);

// Support To-Do List
Renderer.prototype.listitem = function (text) {
    var result;

    if (/^\s*\[[x ]\]\s*/.test(text)) {
        text = text.replace(/^\s*\[ \]\s*/, '<input type="checkbox"></input> ').replace(/^\s*\[x\]\s*/, '<input type="checkbox" checked></input> ');
        result = '<li style="list-style: none">' + text + '</li>\n';
    } else {
        result = '<li>' + text + '</li>\n';
    }

    return result;
};

// Add id attribute to headings
Renderer.prototype.heading = function (text, level) {
    var transformOption = this.options.modifyAnchors;
    var id = anchorId(stripHTML(text), transformOption);
    var headingId = this._headingId;

    // Add a number after id if repeated
    if (headingId[id]) {
        id += '-' + headingId[id]++;
    } else {
        headingId[id] = 1;
    }
    // add headerlink
    return '<h' + level + ' id="' + id + '"><a href="#' + id + '" class="headerlink" title="' + stripHTML(text) + '"></a>' + text + '</h' + level + '>';
};

function anchorId(str, transformOption) {
    return util.slugize(str.trim(), { transform: transformOption });
}

// Support AutoLink option
Renderer.prototype.link = function (href, title, text) {
    var prot;

    if (this.options.sanitize) {
        try {
            prot = decodeURIComponent(unescape(href))
                .replace(/[^\w:]/g, '')
                .toLowerCase();
        } catch (e) {
            return '';
        }

        if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
            return '';
        }
    }

    if (!this.options.autolink && href === text && title == null) {
        return href;
    }

    var out = '<a href="' + href + '"';

    if (title) {
        out += ' title="' + title + '"';
    }

    out += '>' + text + '</a>';
    return out;
};

// Support Basic Description Lists
Renderer.prototype.paragraph = function (text) {
    var result = '';
    var dlTest = /(^|\s)(\S.+)(<br>:(\s+))(\S.+)/;

    var dl
        = '<dl>'
        + '<dt>$2</dt>'
        + '<dd>$5</dd>'
        + '</dl>';

    if (text.match(dlTest)) {
        result = text.replace(dlTest, dl);
    } else {
        result = '<p>' + text + '</p>\n';
    }

    return result;
};

marked.setOptions({
    langPrefix: '',
    highlight: function (code, lang) {
        return highlight(stripIndent(code), {
            lang: lang
        });
    }
});

let opts = {
    gfm: true,
    pedantic: false,
    sanitize: false,
    tables: true,
    breaks: true,
    smartLists: true,
    smartypants: true,
    modifyAnchors: '',
    autolink: true
}

module.exports = function (data, options) { 
    if(!options){
        options = opts
    }
    return marked(data, {
        renderer: new Renderer(),
        options
    });
};