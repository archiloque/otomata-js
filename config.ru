app = proc do |env|
  Rack::File.new('.').call(env)
end

run app