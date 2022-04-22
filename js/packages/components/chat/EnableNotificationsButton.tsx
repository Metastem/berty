import React, { useContext, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import { ButtonSetting } from '@berty/components/shared-components'
import { RESULTS } from 'react-native-permissions'
import { useNavigation } from '@berty/navigation'
import { useStyles } from '@berty/contexts/styles'
import { selectClient, selectProtocolClient } from '@berty/redux/reducers/ui.reducer'
import { useAccount, useConversation } from '@berty/hooks'
import { UnifiedText } from '../shared-components/UnifiedText'
import { conversationPushToggleState, pushAvailable } from '@berty/store/push'
import PermissionsContext from '@berty/contexts/permissions.context'

const EnableNotificationsButton: React.FC<{
	conversationPk: string
}> = ({ conversationPk }) => {
	const { t } = useTranslation()
	const { navigate } = useNavigation()
	const { padding } = useStyles()
	const protocolClient = useSelector(selectProtocolClient)

	const conv = useConversation(conversationPk)
	const account = useAccount()
	const client = useSelector(selectClient)
	const { permissions } = useContext(PermissionsContext)

	const pushTokenShared = useMemo(
		() => conv?.sharedPushTokenIdentifier !== undefined && conv?.sharedPushTokenIdentifier !== '',
		[conv],
	)
	const conversationNotMuted = useMemo(
		() => (conv?.mutedUntil ? conv?.mutedUntil : 0) < Date.now(),
		[conv],
	)
	const pushPermissionGranted = useMemo(
		() =>
			permissions.notification === RESULTS.GRANTED || permissions.notification === RESULTS.LIMITED,
		[permissions.notification],
	)
	const accountMuted = useMemo(() => (account.mutedUntil || 0) > Date.now(), [account.mutedUntil])

	if (!pushAvailable || permissions.notification === RESULTS.UNAVAILABLE) {
		return (
			<ButtonSetting
				icon='bell-outline'
				name={t('chat.push-notifications.unsupported')}
				actionIcon={null}
				alone={true}
				disabled
			/>
		)
	}

	return (
		<>
			<ButtonSetting
				icon='bell-outline'
				name={t('chat.push-notifications.title')}
				alone={true}
				toggled={true}
				varToggle={pushTokenShared && conversationNotMuted && pushPermissionGranted}
				actionToggle={async () => {
					await conversationPushToggleState({
						t,
						messengerClient: client,
						protocolClient,
						conversation: conv,
						navigate,
					})
				}}
			/>
			{pushTokenShared && !pushPermissionGranted && (
				<UnifiedText style={[padding.left.small, padding.right.small, padding.top.small]}>
					{t('chat.push-notifications.check-device-settings')}
				</UnifiedText>
			)}
			{pushTokenShared && accountMuted && (
				<UnifiedText style={[padding.left.small, padding.right.small, padding.top.small]}>
					{t('chat.push-notifications.check-account-settings')}
				</UnifiedText>
			)}
		</>
	)
}

export default EnableNotificationsButton
