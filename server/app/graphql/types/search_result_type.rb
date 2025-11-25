module Types
  class SearchResultType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :category, String, null: false
  end
end
