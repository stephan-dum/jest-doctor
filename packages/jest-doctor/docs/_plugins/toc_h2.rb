module Jekyll
  module H2Toc
    def toc_h2(content)
      require 'nokogiri'
      doc = Nokogiri::HTML.fragment(content)
      list = "<ul class='toc'>"
      doc.css('h2').each do |h|
        id = h['id'] || h.content.strip.downcase.gsub(/[^a-z0-9]+/, '-')
        text = h.content.strip
        list << "<li><a href='##{id}'>#{text}</a></li>"
      end
      list << "</ul>"
      list
    end
  end
end

Liquid::Template.register_filter(Jekyll::H2Toc)
