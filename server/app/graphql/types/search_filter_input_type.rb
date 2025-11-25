module Types
  class SearchFilterInputType < Types::BaseInputObject
    description "Example input type using @oneOf directive"

    one_of

    argument :by_name, String, required: false
    argument :by_id, ID, required: false
    argument :by_category, String, required: false
  end
end
