# CHANGELOG


## v1.1.0 (2026-01-15)

### Bug Fixes

- Add "-o IdentitiesOnly=yes" to ansible.cfg to prevent find unrelated keys
  ([`2580383`](https://github.com/allenlinli/weihung-pai/commit/2580383964cda6acfd700d548401159845754cf6))

- Add --encrypt-vault-id "default"
  ([`75c0b6a`](https://github.com/allenlinli/weihung-pai/commit/75c0b6a2aff13350e5ccef53122ed2dcd6814ecf))

- Add SSH private key validation to setup wizard
  ([`3170ec0`](https://github.com/allenlinli/weihung-pai/commit/3170ec051e179bc31b5e705ffefeb44f8cdd3c2d))

- Make the Google services optional
  ([`552b242`](https://github.com/allenlinli/weihung-pai/commit/552b242b3835a5bc5ecf1e2e3de59dde80a4c630))

- Use explicit PATH export for bun commands in deploy-bot
  ([`628456e`](https://github.com/allenlinli/weihung-pai/commit/628456e96b57719b0ff68ba112c8f4a76453c583))

### Features

- **merlin**: Add obsidian livesync tools with secure credential injection
  ([`aa6d7cb`](https://github.com/allenlinli/weihung-pai/commit/aa6d7cbfda0a4e2edf00ea56b42d9798861b3475))

- **pai-bot**: Add idle timeout and heartbeat mechanism for Claude process
  ([`28ad263`](https://github.com/allenlinli/weihung-pai/commit/28ad2638e2c96ba16ffc0e2861f03785efa4dab5))

### Refactoring

- Unify env injection to deploy-bot
  ([`d9f9641`](https://github.com/allenlinli/weihung-pai/commit/d9f96418de6f16c62a33109a65e12fe3d3a5c193))


## v1.0.0 (2026-01-13)

- Initial Release
