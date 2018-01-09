'use strict'

const fs = require('fs')
const path = require('path')

class TplChange {
  constructor () {}

  SmToNj (dir, type) {
      fs.readdir(dir, (err, files) => {
        if (err) throw err
        files.forEach((item, index) => {
            let filePath = path.join(dir, item)
            fs.stat(filePath, (err, stat) => {
                if (err) throw err
                if (stat.isDirectory()) {
                    //如果是目录，递归遍历
                    this.SmToNj(filePath, type)
                } else {
                    //是模版文件
                    if (/(\.tpl)|(\.nj)|(.njk)/.test(filePath)) {
                        fs.readFile(filePath, 'utf-8', (err, data) => {
                          if (err) throw err
                          data = data.replace(/\$/g, '') // $ -> ''
                                      .replace(/isset/g, '') // isset -> ''
                                      .replace(/\!empty/g, '') // !empty -> ''
                                      .replace(/\{literal\}|\{\/literal\}/g, '')
                                      .replace(/([a-zA-Z].?)(\-\>)([a-zA-Z].?)/g, '$1.$3') // xxx->xxx -> xxx.xxx 为了防止把js中的注释箭头也替换掉所以需要用分组的方法
                                      .replace(/\{if(.+?)\}/g, '{% if $1 %}') // {if xxx} -> {% if xxx %}
                                      .replace(/\{elseif(.+?)\}/g, '{% elif $1 %}') // {elseif xxx} -> {% elif xxx %}
                                      .replace(/\{\/if\}/g, '{% endif %}') // {\if} -> {% endif %}
                                      .replace(/\&\&/g, 'and') // && -> and
                                      .replace(/\|\|/g, 'or') // || -> or
                                      .replace(/\{\*(.*)\*\}/g, '{# $1 #}') // {* xxx *} -> {# xxx #}
                                      .replace(/\{([0-9a-zA-Z\.\"\:\%\'\|\_\\/\(\)[\]]+)\}/g, '{{ $1 }}') // { xxx } -> {{ xxx }} 为了防止把{% xxx %}这种格式也改掉
                                      .replace(/\{foreach from=(.*?) item=(.*?)\}/g, "{% for $2 in $1 %}") // {foreach from=config.data.HeaderBanner item=item} -> "{% for item in config.data.HeaderBanner %}"
                                      .replace(/\{\/foreach\}/g, '{% endfor %}') // {\foreach} -> {% endfor %}
                                      .replace(/\{assign var=(.*?) value=(.*?)\}/g, "{% set $1=$2 %}") // {assign var=item value=peple} -> {% set item=people %}
                                      .replace(/{extends file=(.*?)\}/g, "{extends $1}") // '{extends file="[layout]base.tpl"}' -> "{extends "[layout]base.tpl"}"
                                      .replace(/{block name=\"(.*?)\"\}/g, "{% block $1 %}") // {block name="xxx"} -> {% block xxx %}
                                      .replace(/\{\/block\}/g, "{% endblock %}") // {\block} -> {% endblock %}
                                      .replace(/\{section name=(\"?)(.*?)(\"?) loop=(.*?)\}/g, "{% for $2 in $4 %}") // '{section name="rank" loop=ranking}' -> "{% for rank in ranking %}"
                                      .replace(/\{\/section\}/g, "{% endfor %}") // {/section} -> {% endfor %}
                                      .replace(/\{% for(.*?)name=(.*?) in (.*?)\%\}/g, '{% for $1 in $3 %}') // '{% for a name=area in area %}' -> "{% for  a  in area  %}"
                                      .replace(/\{include file=(.*?)\}/g, (res, $1) => {
                                        $1 = $1.split('.')[0]
                                        const data = '{% include ' + $1 + '.nj\"' +' %}'
                                        return data
                                      }) // {include file="v1/basetitle.tpl"} -> {% include "v1/playarea/playarea.nj" %}
                                      .replace(/\{capture name=(.*?)\}(.*?)\{\/capture\}/g,'{% set $1 %}$2{% endset %}') // '{capture name=weiboShareUrl}{{"http://v-wb.youku.com/v_show/id_"}}{{ video.encoded_id }}.html{/capture}' -> "{% set weiboShareUrl %}{{"http://v-wb.youku.com/v_show/id_"}}{{ video.encoded_id }}.html{% endset %}"
                                      .replace(/\{foreach name=(.*?) from=(.*?) item=(.*?) key=(.*?)\}/g, "{% for $4,$3 in $2 %}") //'{foreach name=rankingTabber from=ranking item=r key=k}' -> {% for k,r in ranking %}
                                      .replace(/smarty.(foreach|section).(.*?).first/g, "loop.first") // smarty.foreach.(.*?).first -> loop.first
                                      .replace(/smarty.(foreach|section).(.*?).iteration/g, "loop.index") // smarty.foreach.(.*?).iteration -> loop.index
                                      .replace(/smarty.(foreach|section).(.*?).last/g, "loop.last") // smarty.foreach.(.*?).last -> loop.last
                                      .replace(/in_array\((.*?)\,(\s?)array\((.*?)\)/g, "[$3].indexOf($1)") // 'in_array(item.type,array('ad','cms'))' -> "['ad','cms'].indexOf(item.type))"
                                      .replace(/\{section name=(.*?)(\s+?)loop=(.*?)\}\{assign var=(.*?) value=(.*?)\}\{(.*?)\}(\s*?)\{\/section\}/g, 
                                      (res, $1, $2, $3, $4, $5, $6) => {
                                        $6 = $6.split('.')[1]
                                        const data = '{% for '+ $1 +' in '+ $3 +' %}' +'{{'+ $5 +'.' + $6 + '}}{% endfor %}'
                                        return data
                                      })  
                                      // {section name=list loop=$tags->items}{assign var=item value=$tags->items[list]}{$item->tag_name} {/section}
                                      // -> {% for list in tags.items %}{{tags.items[list].tag_name}}{% endfor %} 
                          const len = filePath.split('/').length 
                          const curfilename = filePath.split('/')[len - 1]
                          const newPath = dir + '/new' + curfilename
                          if (type == "true") {
                            fs.writeFile(filePath, data, 'utf-8', (err, data) => {
                              if (err) throw err
                            })
                          }
                          else {
                            fs.writeFile(newPath, data, 'utf-8', (err, data) => {
                              if (err) throw err
                            })
                          }
                      })
                    }
                }
            })
        })
    })
  }
}

module.exports = TplChange
