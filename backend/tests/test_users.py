import pytest
from src.tools.users import Users

@pytest.fixture
def user_service():
    """Setup the Users instance for every test."""
    return Users()


@pytest.mark.parametrize("query, expected_name_fragment", [
    ("Dipish", "Dipish"),           # Case 1: Fuzzy
    ("Rahul Sharma", "Rahul Sharma"), # Case 2: Exact
    ("Alice", "Alice"),             # Case 3: Partial
])
def test_search_scenarios(user_service, query, expected_name_fragment):
    """
    Parametrized test to verify fuzzy, exact, and partial searches.
    """
    # Act
    results = user_service.search_user(query)

    # Assert
    assert len(results) > 0, f"Expected results for query: '{query}'"
    
    # Verify at least one result matches the expectation
    # We use a generator expression inside any() for cleaner code
    match_found = any(expected_name_fragment in r['name'] for r in results)
    assert match_found, f"Expected to find '{expected_name_fragment}' in results for '{query}'"


@pytest.mark.parametrize("user_id, expected_country", [
    (2, None), # We assume we don't know the country strictly, or you can fill it in if known
])
def test_get_user_by_id(user_service, user_id, expected_country):
    """
    Verify retrieval by ID.
    """
    user = user_service.get_user_by_id(user_id)
    assert user is not None, f"User {user_id} should exist"
    assert user['id'] == user_id
    
    if expected_country:
        assert user['country'] == expected_country


def test_get_all_users_structure(user_service):
    """
    Verify the structure of the full user list.
    Kept separate as it doesn't fit the 'input -> output' pattern of the others.
    """
    all_users = user_service.get_all_users()
    assert len(all_users) > 0
    assert isinstance(all_users, list)