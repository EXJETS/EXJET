class ProviderError(Exception):
    """A provider call failed. Safe to retry from a job."""


class NotImplementedProvider(NotImplementedError):
    """A real provider that has not been built yet. Selecting it fails loudly instead of faking."""
